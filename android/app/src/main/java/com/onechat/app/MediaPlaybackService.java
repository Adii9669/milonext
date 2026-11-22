package com.onechat.app;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.media.AudioAttributes;
import android.media.AudioFocusRequest;
import android.media.AudioManager;
import android.media.MediaPlayer;
import android.os.Build;
import android.os.IBinder;
import android.os.PowerManager;
import androidx.core.app.NotificationCompat;

public class MediaPlaybackService extends Service implements
        AudioManager.OnAudioFocusChangeListener,
        MediaPlayer.OnPreparedListener,
        MediaPlayer.OnErrorListener,
        MediaPlayer.OnCompletionListener {

    public static final String ACTION_PLAY = "com.onechat.app.ACTION_PLAY";
    public static final String ACTION_PAUSE = "com.onechat.app.ACTION_PAUSE";
    public static final String ACTION_RESUME = "com.onechat.app.ACTION_RESUME";
    public static final String ACTION_STOP = "com.onechat.app.ACTION_STOP";

    public static final String EXTRA_URL = "extra_url";
    public static final String EXTRA_TITLE = "extra_title";
    public static final String EXTRA_ARTIST = "extra_artist";

    private static final String CHANNEL_ID = "onechat_jam_playback";
    private static final int NOTIFICATION_ID = 40401;

    private MediaPlayer mediaPlayer;
    private AudioManager audioManager;
    private AudioFocusRequest focusRequest;
    private String currentTitle = "Onechat Jam";
    private String currentArtist = "Live Radio";
    private boolean isPlaying = false;

    public interface StateCallback {
        void onPlaybackStateChanged(String state);
    }
    public static StateCallback stateCallback;

    @Override
    public void onCreate() {
        super.onCreate();
        audioManager = (AudioManager) getSystemService(Context.AUDIO_SERVICE);
        createNotificationChannel();
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        if (intent == null || intent.getAction() == null) {
            return START_NOT_STICKY;
        }

        String action = intent.getAction();
        switch (action) {
            case ACTION_PLAY:
                String url = intent.getStringExtra(EXTRA_URL);
                String title = intent.getStringExtra(EXTRA_TITLE);
                String artist = intent.getStringExtra(EXTRA_ARTIST);
                if (title != null) currentTitle = title;
                if (artist != null) currentArtist = artist;
                if (url != null) playStream(url);
                break;
            case ACTION_PAUSE:
                pauseStream();
                break;
            case ACTION_RESUME:
                resumeStream();
                break;
            case ACTION_STOP:
                stopStream();
                stopSelf();
                break;
        }

        return START_NOT_STICKY;
    }

    private void playStream(String url) {
        stopMediaPlayer();

        if (!requestAudioFocus()) {
            notifyState("error");
            return;
        }

        notifyState("loading");
        startForeground(NOTIFICATION_ID, buildNotification(false, "Connecting..."));

        try {
            mediaPlayer = new MediaPlayer();
            mediaPlayer.setAudioAttributes(
                new AudioAttributes.Builder()
                    .setContentType(AudioAttributes.CONTENT_TYPE_MUSIC)
                    .setUsage(AudioAttributes.USAGE_MEDIA)
                    .build()
            );
            mediaPlayer.setWakeMode(getApplicationContext(), PowerManager.PARTIAL_WAKE_LOCK);
            mediaPlayer.setDataSource(url);
            mediaPlayer.setOnPreparedListener(this);
            mediaPlayer.setOnErrorListener(this);
            mediaPlayer.setOnCompletionListener(this);
            mediaPlayer.prepareAsync();
        } catch (Exception e) {
            notifyState("error");
            stopSelf();
        }
    }

    @Override
    public void onPrepared(MediaPlayer mp) {
        mp.start();
        isPlaying = true;
        notifyState("playing");
        startForeground(NOTIFICATION_ID, buildNotification(true, currentArtist));
    }

    private void pauseStream() {
        if (mediaPlayer != null && isPlaying) {
            mediaPlayer.pause();
            isPlaying = false;
            notifyState("paused");
            startForeground(NOTIFICATION_ID, buildNotification(false, currentArtist));
        }
    }

    private void resumeStream() {
        if (mediaPlayer != null && !isPlaying) {
            if (requestAudioFocus()) {
                mediaPlayer.start();
                isPlaying = true;
                notifyState("playing");
                startForeground(NOTIFICATION_ID, buildNotification(true, currentArtist));
            }
        }
    }

    private void stopStream() {
        isPlaying = false;
        notifyState("idle");
        stopMediaPlayer();
        abandonAudioFocus();
        stopForeground(true);
    }

    private void stopMediaPlayer() {
        if (mediaPlayer != null) {
            try {
                if (mediaPlayer.isPlaying()) mediaPlayer.stop();
                mediaPlayer.reset();
                mediaPlayer.release();
            } catch (Exception ignored) {}
            mediaPlayer = null;
        }
    }

    private boolean requestAudioFocus() {
        if (audioManager == null) return false;

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            AudioAttributes playbackAttributes = new AudioAttributes.Builder()
                .setUsage(AudioAttributes.USAGE_MEDIA)
                .setContentType(AudioAttributes.CONTENT_TYPE_MUSIC)
                .build();
            focusRequest = new AudioFocusRequest.Builder(AudioManager.AUDIOFOCUS_GAIN)
                .setAudioAttributes(playbackAttributes)
                .setAcceptsDelayedFocusGain(true)
                .setOnAudioFocusChangeListener(this)
                .build();
            return audioManager.requestAudioFocus(focusRequest) == AudioManager.AUDIOFOCUS_REQUEST_GRANTED;
        } else {
            return audioManager.requestAudioFocus(this, AudioManager.STREAM_MUSIC, AudioManager.AUDIOFOCUS_GAIN) == AudioManager.AUDIOFOCUS_REQUEST_GRANTED;
        }
    }

    private void abandonAudioFocus() {
        if (audioManager == null) return;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O && focusRequest != null) {
            audioManager.abandonAudioFocusRequest(focusRequest);
        } else {
            audioManager.abandonAudioFocus(this);
        }
    }

    @Override
    public void onAudioFocusChange(int focusChange) {
        switch (focusChange) {
            case AudioManager.AUDIOFOCUS_LOSS:
            case AudioManager.AUDIOFOCUS_LOSS_TRANSIENT:
                pauseStream();
                break;
            case AudioManager.AUDIOFOCUS_LOSS_TRANSIENT_CAN_DUCK:
                if (mediaPlayer != null) mediaPlayer.setVolume(0.2f, 0.2f);
                break;
            case AudioManager.AUDIOFOCUS_GAIN:
                if (mediaPlayer != null) mediaPlayer.setVolume(1.0f, 1.0f);
                break;
        }
    }

    @Override
    public boolean onError(MediaPlayer mp, int what, int extra) {
        // Release first, then report — stopStream() would overwrite the state
        // with "idle" and the JS player would never show the error.
        isPlaying = false;
        stopMediaPlayer();
        abandonAudioFocus();
        stopForeground(true);
        notifyState("error");
        return true;
    }

    @Override
    public void onCompletion(MediaPlayer mp) {
        // "ended" lets the JS AudioEngine advance the Jam play queue.
        // Do not call stopStream(): it emits "idle" and races the next track.
        isPlaying = false;
        stopMediaPlayer();
        abandonAudioFocus();
        stopForeground(true);
        notifyState("ended");
    }

    private void notifyState(String state) {
        if (stateCallback != null) {
            stateCallback.onPlaybackStateChanged(state);
        }
    }

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                CHANNEL_ID,
                "Onechat Jam Audio",
                NotificationManager.IMPORTANCE_LOW
            );
            channel.setDescription("Background live radio streaming notification");
            channel.setShowBadge(false);
            NotificationManager manager = getSystemService(NotificationManager.class);
            if (manager != null) {
                manager.createNotificationChannel(channel);
            }
        }
    }

    private Notification buildNotification(boolean isPlayingNow, String subText) {
        Intent notificationIntent = new Intent(this, MainActivity.class);
        PendingIntent pendingIntent = PendingIntent.getActivity(
            this, 0, notificationIntent,
            PendingIntent.FLAG_IMMUTABLE | PendingIntent.FLAG_UPDATE_CURRENT
        );

        Intent pauseIntent = new Intent(this, MediaPlaybackService.class);
        pauseIntent.setAction(isPlayingNow ? ACTION_PAUSE : ACTION_RESUME);
        PendingIntent togglePendingIntent = PendingIntent.getService(
            this, 1, pauseIntent,
            PendingIntent.FLAG_IMMUTABLE | PendingIntent.FLAG_UPDATE_CURRENT
        );

        Intent stopIntent = new Intent(this, MediaPlaybackService.class);
        stopIntent.setAction(ACTION_STOP);
        PendingIntent stopPendingIntent = PendingIntent.getService(
            this, 2, stopIntent,
            PendingIntent.FLAG_IMMUTABLE | PendingIntent.FLAG_UPDATE_CURRENT
        );

        NotificationCompat.Builder builder = new NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle(currentTitle)
            .setContentText(subText)
            .setSmallIcon(android.R.drawable.ic_media_play)
            .setContentIntent(pendingIntent)
            .setOngoing(isPlayingNow)
            .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
            .addAction(
                isPlayingNow ? android.R.drawable.ic_media_pause : android.R.drawable.ic_media_play,
                isPlayingNow ? "Pause" : "Play",
                togglePendingIntent
            )
            .addAction(
                android.R.drawable.ic_menu_close_clear_cancel,
                "Stop",
                stopPendingIntent
            );

        return builder.build();
    }

    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }

    @Override
    public void onDestroy() {
        stopMediaPlayer();
        abandonAudioFocus();
        super.onDestroy();
    }
}
