import { SignupForm } from '@/features/auth/components/sign-up-form'
import { AuthView } from '@/features/auth/components/auth-view'
import React from 'react'

const SignUpPage = () => {
    return (
        <AuthView>
            <SignupForm/>
        </AuthView>
    )
};

export default SignUpPage;
