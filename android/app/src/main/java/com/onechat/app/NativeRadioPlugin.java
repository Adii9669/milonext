package com.onechat.app;

import android.content.Context;
import android.content.Intent;
import android.os.Build;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "NativeRadio")
public class NativeRadioPlugin extends Plugin {

    @Override
    public void load() {
        super.load();
        MediaPlaybackService.stateCallback = new MediaPlaybackService.StateCallback() {
            @Override
            public void onPlaybackStateChanged(String state) {
                JSObject ret = new JSObject();
                ret.put("state", state);
                notifyListeners("playbackStateChanged", ret);
            }
        };
    }

    @PluginMethod
    public void play(PluginCall call) {
        String url = call.getString("url");
        String title = call.getString("title", "Onechat Jam");
        String artist = call.getString("artist", "Live Radio");

        if (url == null || url.isEmpty()) {
            call.reject("URL cannot be empty");
            return;
        }

        Context context = getContext();
        Intent intent = new Intent(context, MediaPlaybackService.class);
        intent.setAction(MediaPlaybackService.ACTION_PLAY);
        intent.putExtra(MediaPlaybackService.EXTRA_URL, url);
        intent.putExtra(MediaPlaybackService.EXTRA_TITLE, title);
        intent.putExtra(MediaPlaybackService.EXTRA_ARTIST, artist);

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            context.startForegroundService(intent);
        } else {
            context.startService(intent);
        }

        JSObject ret = new JSObject();
        ret.put("status", "playing");
        call.resolve(ret);
    }

    @PluginMethod
    public void pause(PluginCall call) {
        Context context = getContext();
        Intent intent = new Intent(context, MediaPlaybackService.class);
        intent.setAction(MediaPlaybackService.ACTION_PAUSE);
        context.startService(intent);
        call.resolve();
    }

    @PluginMethod
    public void resume(PluginCall call) {
        Context context = getContext();
        Intent intent = new Intent(context, MediaPlaybackService.class);
        intent.setAction(MediaPlaybackService.ACTION_RESUME);
        context.startService(intent);
        call.resolve();
    }

    @PluginMethod
    public void stop(PluginCall call) {
        Context context = getContext();
        Intent intent = new Intent(context, MediaPlaybackService.class);
        intent.setAction(MediaPlaybackService.ACTION_STOP);
        context.startService(intent);
        call.resolve();
    }
}
