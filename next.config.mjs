
/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: false,
    images: {
        remotePatterns: [
            {
                hostname: "uploadthing.com",
                protocol: "https"
            },
            {
                hostname: "utfs.io",
                protocol: "https"
            }
        ]
    },

    ssg: false // means build time the pages wont generate static html, only runtime with ISR

};

export default nextConfig;
