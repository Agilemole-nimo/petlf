import type { NextConfig } from "next";
const config:NextConfig={output:"export",trailingSlash:true,poweredByHeader:false,images:{unoptimized:true,remotePatterns:[{protocol:"https",hostname:"images.unsplash.com"}]}};
export default config;
