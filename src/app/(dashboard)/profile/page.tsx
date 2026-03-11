import { ProfileError, ProfileLoading, ProfileView } from '@/features/profile/_components/ProfileView'
import { Suspense } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { HydrateClient } from "@/trpc/server";
import { requireAuth } from '@/lib/auth-utils';
import { profileParamsLoader } from '@/features/profile/server/params-loader';
import { prefetchProfileData } from '@/features/profile/server/prefetch';

const ProfilePage = async () => {
    await requireAuth();
    
    await profileParamsLoader({});
    prefetchProfileData();
    
    return (
        <HydrateClient>
            <ErrorBoundary fallback={<ProfileError/>}>
                <Suspense fallback={<ProfileLoading />}>
                    <ProfileView />
                </Suspense>
            </ErrorBoundary>
        </HydrateClient>
    )
}

export default ProfilePage