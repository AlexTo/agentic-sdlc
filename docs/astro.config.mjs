// @ts-check
import { defineConfig } from 'astro/config';

import starlight from '@astrojs/starlight';
import astroD2 from 'astro-d2';

const basePath = process.env.DOCS_BASE_PATH || '/agentic-sdlc';

// https://astro.build/config
export default defineConfig({
  site: 'https://alexto.github.io',
  base: basePath,
  outDir: './dist',
  // Redirect the root URL to the default locale so visitors land on localised content.
  redirects: {
    '/': `${basePath}/en`,
  },
  integrations: [
    starlight({
      title: 'Agentic SDLC',
      social: [
        {
          icon: 'github',
          label: 'GitHub',
          href: 'https://github.com/AlexTo/agentic-sdlc',
        },
      ],
      tableOfContents: {
        minHeadingLevel: 2,
        maxHeadingLevel: 4,
      },
      defaultLocale: 'en',
      locales: {
        en: {
          label: 'English',
        },
        jp: {
          label: '日本語',
          lang: 'ja',
        },
        ko: {
          label: '한국어',
        },
        es: {
          label: 'Español',
        },
        pt: {
          label: 'Português',
        },
        fr: {
          label: 'Français',
        },
        it: {
          label: 'Italiano',
        },
        zh: {
          label: '中文',
          lang: 'zh-CN',
        },
        vi: {
          label: 'Tiếng Việt',
        },
      },
      sidebar: [
        {
          label: 'Start here',
          translations: {
            ja: 'はじめに',
            ko: '시작하기',
            es: 'Empieza aquí',
            pt: 'Comece aqui',
            fr: 'Commencer ici',
            it: 'Inizia qui',
            'zh-CN': '从这里开始',
            vi: 'Bắt đầu tại đây',
          },
          items: [{ autogenerate: { directory: 'guides' } }],
        },
        {
          label: 'Concepts',
          translations: {
            ja: 'コンセプト',
            ko: '개념',
            es: 'Conceptos',
            pt: 'Conceitos',
            fr: 'Concepts',
            it: 'Concetti',
            'zh-CN': '概念',
            vi: 'Khái niệm',
          },
          items: [{ autogenerate: { directory: 'concepts' } }],
        },
        {
          label: 'How Discava does it',
          translations: {
            ja: 'Discava での実践',
            ko: 'Discava의 구현 방식',
            es: 'Cómo lo hace Discava',
            pt: 'Como o Discava faz',
            fr: 'Comment Discava procède',
            it: 'Come lo fa Discava',
            'zh-CN': 'Discava 的做法',
            vi: 'Cách Discava thực hiện',
          },
          items: [{ autogenerate: { directory: 'discava' } }],
        },
        {
          label: 'Set it up: fork and run',
          translations: {
            ja: 'セットアップ: フォークして実行',
            ko: '설정: 포크하고 실행하기',
            es: 'Configuración: haz un fork y ejecuta',
            pt: 'Configuração: faça um fork e execute',
            fr: 'Mise en place : forker et lancer',
            it: 'Configurazione: fai un fork ed esegui',
            'zh-CN': '设置：Fork 并运行',
            vi: 'Thiết lập: fork và chạy',
          },
          items: [{ autogenerate: { directory: 'setup' } }],
        },
        {
          label: 'Adopt it in your own repository',
          translations: {
            ja: '自分のリポジトリに導入する',
            ko: '자신의 저장소에 도입하기',
            es: 'Adóptalo en tu propio repositorio',
            pt: 'Adote no seu próprio repositório',
            fr: 'L’adopter dans votre propre dépôt',
            it: 'Adottalo nel tuo repository',
            'zh-CN': '在你自己的仓库中采用',
            vi: 'Áp dụng vào kho mã của bạn',
          },
          collapsed: true,
          items: [{ autogenerate: { directory: 'adopt' } }],
        },
        {
          label: 'Tutorial: add a feature',
          translations: {
            ja: 'チュートリアル: 機能を追加する',
            ko: '튜토리얼: 기능 추가하기',
            es: 'Tutorial: añade una funcionalidad',
            pt: 'Tutorial: adicione uma funcionalidade',
            fr: 'Tutoriel : ajouter une fonctionnalité',
            it: 'Tutorial: aggiungi una funzionalità',
            'zh-CN': '教程：添加一个功能',
            vi: 'Hướng dẫn: thêm một tính năng',
          },
          items: [{ autogenerate: { directory: 'tutorial' } }],
        },
        {
          label: 'Reference',
          translations: {
            ja: 'リファレンス',
            ko: '참고 자료',
            es: 'Referencia',
            pt: 'Referência',
            fr: 'Référence',
            it: 'Riferimento',
            'zh-CN': '参考',
            vi: 'Tham khảo',
          },
          items: [{ autogenerate: { directory: 'reference' } }],
        },
      ],
      customCss: ['./src/styles/custom.css'],
      plugins: [],
    }),
    // Renders ```d2 code blocks to static SVG at build time (D2 runs as WASM).
    astroD2({ sketch: true, experimental: { useD2js: true } }),
  ],
});
