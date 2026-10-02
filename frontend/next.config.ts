import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * Gera um servidor auto-contido em `.next/standalone`, com apenas as
   * dependências realmente usadas. É o que a imagem Docker copia.
   * Fica desligado na Vercel (variável VERCEL), onde o build é feito pela
   * própria plataforma e o modo standalone quebra a etapa final do build.
   */
  output: process.env.VERCEL ? undefined : "standalone",
};

export default nextConfig;
