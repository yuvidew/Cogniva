
import { Button } from '../ui/button'
import { ZapIcon } from 'lucide-react'
import { authClient } from '@/lib/auth-client'

export const PlanSection = () => {
    
    return (
        <section className='p-4 border rounded-md w-full bg-[#2560e8]/5'>
            <div className='flex flex-col gap-4'>
                <div className='flex items-center gap-2'>
                    <Button size = "icon-sm">
                        <ZapIcon />
                    </Button>

                    <div className='flex flex-col '>
                        <h4 className=' font-medium'>Upgrade to Pro</h4>
                        <p className='text-xs text-muted-foreground'>Get more power with a Pro plan.</p>
                    </div>
                </div>

                <Button onClick={() => authClient.checkout({slug : "cognvia-pro"})}>
                    Upgrade to Pro - $29.99
                </Button>
            </div>
        </section>
    )
}
