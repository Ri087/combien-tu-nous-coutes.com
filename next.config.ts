import "./env";

const nextConfig = {
  headers: async () => {
    return [
      {
        source: "/((?!_next/static).*)",
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
