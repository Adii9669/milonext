export function ConnectLoading({
    text,
}: {
    text: string;
}) {

    return (

        <div
            className="
                flex
                h-screen
                items-center
                justify-center
            "
        >

            <p
                className="
                    text-text-muted
                "
            >
                {text}
            </p>

        </div>
    );
}