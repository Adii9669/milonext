"use client";

import {
    Plus,
    Smile,
} from "lucide-react";

export function ComposerActions() {

    return (

        <>

            {/* Upload */}

            <button
                type="button"

                className="
                    flex
                    h-10
                    w-10

                    items-center
                    justify-center

                    rounded-xl

                    text-text-secondary

                    transition-all
                    duration-200

                    hover:bg-surface-hover
                    hover:text-text-primary
                "
            >

                <Plus size={20} />

            </button>

            {/* Emoji */}

            <button
                type="button"

                className="
                    flex
                    h-10
                    w-10

                    items-center
                    justify-center

                    rounded-xl

                    text-text-secondary

                    transition-all
                    duration-200

                    hover:bg-surface-hover
                    hover:text-text-primary
                "
            >

                <Smile size={20} />

            </button>

        </>
    );
}