import { SigninForm } from '@/features/auth/components/sign-in-form'
import { AuthView } from '@/features/auth/components/auth-view'
import React from 'react'

const SignInPage = () => {
    return (
        <AuthView>
            <SigninForm/>
        </AuthView>
    )
};

export default SignInPage;
