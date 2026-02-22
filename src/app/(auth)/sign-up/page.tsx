import { SignupForm } from '@/features/auth/components/sign-up-form'
import { requireUnAuth } from '@/lib/auth-utils';


const SignUpPage = async() => {
    await requireUnAuth();
    return (
        <SignupForm/>
    )
};

export default SignUpPage;
