/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "climbing-shop-851c1ee23d02.herokuapp.com",
                pathname: "/**",
            },
        ],
    },
};

export default nextConfig;
