import { SigninForm } from '@/features/auth/components/sign-in-form'
import { requireUnAuth } from '@/lib/auth-utils';


const SignInPage = async() => {
    await requireUnAuth();
    return (
        <SigninForm/>
    )
};

export default SignInPage;
