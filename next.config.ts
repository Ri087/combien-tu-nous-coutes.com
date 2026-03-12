import "./env";

const nextConfig = {
  headers: async () => {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Content-Type",
            value: "text/html; charset=utf-8",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
