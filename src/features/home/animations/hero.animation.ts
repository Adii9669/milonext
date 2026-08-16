export const TitleAnimation = {

    initial: {
        opacity: 2,
         y: 0,
        filter: "blur(0px)",
    },

    animate: {
        opacity: 0,
        y: 0,
        // filter: "blur(12px)",
    },

    transition: {
        duration: 1.2,
        ease: [0.22, 1, 0.36, 1],
    },
};