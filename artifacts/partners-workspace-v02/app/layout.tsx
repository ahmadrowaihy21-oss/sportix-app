import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = { title:'SPORTIX PARTNERS & ROOMS CONNECT MVP', description:'مساحة الشركاء الموحدة: الغرف والسوق والكوبونات والمنتجات وIMPACT، مع مختبر معاملات وتكاملات اصطناعية.' };
export default function RootLayout({children}: Readonly<{children: React.ReactNode}>) { return <html lang="ar" dir="rtl"><body>{children}</body></html>; }
