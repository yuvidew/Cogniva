import React from 'react'
import { Button } from '../ui/button'
import { ZapIcon } from 'lucide-react'
import { Progress } from '../ui/progress'

export const PlanSection = () => {
    return (
        <section className='p-4 border rounded-md mt-auto w-[94%]  mx-auto bg-[#2560e8]/5'>
            <div className='flex flex-col gap-4'>
                <div className='flex items-center gap-2'>
                    <Button size = "icon-sm">
                        <ZapIcon />
                    </Button>

                    <div className='flex flex-col '>
                        <h4 className=' font-medium'>Free plan</h4>
                        <p className='text-xs text-muted-foreground'>Upgrade to more power </p>
                    </div>
                </div>

                <div className='flex flex-col gap-1'>
                    <div className='flex items-center justify-between'>
                        <p className='text-sm text-muted-foreground'>Messages left</p>
                        <p className='text-sm font-medium text-primary'>20 / 100</p>
                    </div>
                    <Progress value={20} max={100} />
                </div>

                <Button>
                    Upgrade to Pro - $10 / month
                </Button>
            </div>
        </section>
    )
}
