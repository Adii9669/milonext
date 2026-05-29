interface Props {
    otp: string[];

    setOtp:
        React.Dispatch<
            React.SetStateAction<
                string[]
            >
        >;

    inputRefs:
        React.RefObject<
            (HTMLInputElement | null)[]
        >;
}

export function OTPInput({
    otp,
    setOtp,
    inputRefs,
}: Props) {

    function handleChange(
        value: string,
        index: number
    ) {

        if (isNaN(Number(value)))
            return;

        const newOtp = [...otp];

        newOtp[index] =
            value.slice(-1);

        setOtp(newOtp);

        if (
            value &&
            index < 5
        ) {

            inputRefs.current[
                index + 1
            ]?.focus();
        }
    }

    return (

        <div className="flex gap-2">

            {otp.map((digit, index) => (

                <input
                    key={index}

                    ref={(el) => {
                        inputRefs.current[
                            index
                        ] = el;
                    }}

                    maxLength={1}

                    value={digit}

                    onChange={(e) =>
                        handleChange(
                            e.target.value,
                            index
                        )
                    }
                />

            ))}

        </div>
    );
}