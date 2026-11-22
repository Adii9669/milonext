import { refreshToken }
    from "./refreshToken";

export async function handleResponse(
    response: Response,
    retry: () => Promise<Response>,
    retried = false
) {

    const contentType =
        response.headers.get(
            "content-type"
        );

    const data =
        contentType?.includes(
            "application/json"
        )
            ? await response.json()
            : await response.text();

    if (!response.ok) {

        const tokenExpired =

            response.status === 401 &&

            response.headers.get(
                "X-Token-Expired"
            ) === "true";

        if (tokenExpired) {
            const isAuthOrPublicPage =
                typeof window !== "undefined" &&
                (window.location.pathname.startsWith("/auth") ||
                 window.location.pathname.startsWith("/login") ||
                 window.location.pathname.startsWith("/signup") ||
                 window.location.pathname.startsWith("/home") ||
                 window.location.pathname === "/");

            // Never loop forever if the retried request is still rejected.
            if (retried) {
                if (!isAuthOrPublicPage && typeof window !== "undefined") {
                    window.location.href = "/login";
                }

                throw new Error(
                    "Session expired"
                );
            }

            try {
                await refreshToken();

                const retryResponse =
                    await retry();

                return handleResponse(
                    retryResponse,
                    retry,
                    true
                );

            } catch {
                if (!isAuthOrPublicPage && typeof window !== "undefined") {
                    window.location.href = "/login";
                }

                throw new Error(
                    "Session expired"
                );
            }
        }

        throw new Error(

            typeof data === "string"

                ? data

                : data?.message ||

                data?.error ||

                "Request failed"
        );
    }

    return data;
}