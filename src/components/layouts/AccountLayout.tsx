// import { Navbar, Sidebar } from '@/components/shared';
import React from 'react';

interface AccountLayoutProps {
  children: React.ReactNode;
}

export default function AccountLayout({ children }: AccountLayoutProps) {
  return (
    <>
      <div className=''>
      ACCOUNT LAYOUT
        {/* <Navbar />
        <div className="flex overflow-hidden pt-16 h-full">
        <Sidebar />
        <div className="relative h-full w-full overflow-y-auto lg:ml-64">
        <main>
        <div className="flex h-screen w-full justify-center">
        </div>
        </main>
        </div>
        </div> */}
        <div className="px-6 py-6 bg-blue-100">{children}</div>
      </div>
    </>
  );
}
