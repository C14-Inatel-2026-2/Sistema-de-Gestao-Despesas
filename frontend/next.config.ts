import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * Gera um servidor auto-contido em `.next/standalone`, com apenas as
   * dependências realmente usadas. É o que a imagem Docker copia.
   * Na Vercel esta opção é ignorada — lá o build é feito pela própria plataforma.
   */
  output: "standalone",
};

export default nextConfig;
