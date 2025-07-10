/** @type {import('next').NextConfig} */
const nextConfig = {
    webpack(config) {
      config.module.rules.push({
        test: /\.js\.map$/,
        loader: 'ignore-loader',
      });
      return config;
    },
  };
  
  export default nextConfig;
  