/** @type {import('next').NextConfig} */
const nextConfig = {
    typescript: {
        // !! WARN !!
        // Dangerously allow production builds to successfully complete even if
        // your project has type errors.
        // Doing this because Vercel edge runtime fails to resolve 'mapbox__point-geometry'
        ignoreBuildErrors: true,
    },
};

export default nextConfig;
