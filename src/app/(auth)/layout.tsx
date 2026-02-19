import { ModeToggle } from '@/components/theme-toggle';
import { ReactNode } from 'react';


export default async function AuthLayout({children} : {children: ReactNode}) {
    return (
        <main className="bg-background flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10 relative">
            {/* start to header */}
            <div className="absolute top-4 md:top-8 w-full flex items-center justify-end px-4 max-w-7xl">
                <div className="flex items-center space-x-2">
                    {/* <ModeToggle /> */}
                    <ModeToggle/>
                </div>
            </div>
            {/* end to header */}
            <div className="w-full max-w-sm">
                {children}
            </div>
        </main>
    )
}
