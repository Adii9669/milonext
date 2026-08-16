interface Props {
    isChecking: boolean;

    isAvailable:
        boolean | null;
}

export function UsernameStatus({
    isChecking,
    isAvailable,
}: Props) {

    if (isChecking) {
        return (
            <p>
                Checking username...
            </p>
        );
    }

    if (isAvailable === true) {
        return (
            <p className="text-success">
                Username available
            </p>
        );
    }

    if (isAvailable === false) {
        return (
            <p className="text-error">
                Username taken
            </p>
        );
    }

    return null;
}