"use client";

import {
    SendHorizonal,
} from "lucide-react";

interface Props {

    onSend: () => void;

    disabled: boolean;
}

export function ComposerSendButton({

    onSend,

    disabled,

}: Props) {

    return (

        <button

            onClick={onSend}

            disabled={disabled}

            className="
                flex
                h-10
                w-10

                items-center
                justify-center

                rounded-xl

                bg-primary

                text-primary-foreground

                transition-all
                duration-200

                hover:scale-105

                disabled:opacity-40
                disabled:hover:scale-100
            "
        >

            <SendHorizonal
                size={18}
            />

        </button>
    );
}