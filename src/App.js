import { lazy, Suspense, useEffect } from 'react';

/// Components
import Index from "./jsx";
import { connect, useDispatch } from 'react-redux';
import { Route, Routes, useLocation, useNavigate, useParams, Navigate } from 'react-router-dom';
// action
import { checkAutoLogin, showIdleWarning } from './services/AuthService';
import { isAuthenticated } from './store/selectors/AuthSelectors';
import useIdleTimer from './hooks/useIdleTimer';
import { initializeAccessControl } from './services/AccessControl';

/// Style
import "./vendor/bootstrap-select/dist/css/bootstrap-select.min.css";
import "./css/style.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const SignUp = lazy(() => import('./jsx/pages/Registration'));
const KycUpload = lazy(() => import('./jsx/pages/KycUpload'));
const ForgotPassword = lazy(() => import('./jsx/pages/ForgotPassword'));
const KycLogin = lazy(() => import('./jsx/pages/KycLogin'));
const Login = lazy(() => {
    return new Promise(resolve => {
        setTimeout(() => resolve(import('./jsx/pages/Login')), 500);
    });
});

// Reusable preloader — extracted from your original code
const Preloader = (
    <div id="preloader">
        <div className="sk-three-bounce">
            <div className="sk-child sk-bounce1"></div>
            <div className="sk-child sk-bounce2"></div>
            <div className="sk-child sk-bounce3"></div>
        </div>
    </div>
);

function withRouter(Component) {
    function ComponentWithRouterProp(props) {
        let location = useLocation();
        let navigate = useNavigate();
        let params = useParams();

        return (
            <Component
                {...props}
                router={{ location, navigate, params }}
            />
        );
    }
    return ComponentWithRouterProp;
}

function App(props) {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        checkAutoLogin(dispatch, navigate);
        initializeAccessControl();
    }, []);

    const handleIdleLogout = () => {
        console.log('User idle for 10 minutes - logging out');
        showIdleWarning(dispatch, navigate);
    };

    useIdleTimer(
        props.isAuthenticated ? handleIdleLogout : () => {},
        600000
    );

    if (props.isAuthenticated) {
        return (
            <Suspense fallback={Preloader}>
                <Routes>
                    {/* Redirect /login back to dashboard if already authenticated */}
                    <Route path='/login' element={<Navigate to="/" replace />} />
                    <Route path='/*' element={<Index />} />
                </Routes>
            </Suspense>
        );
    } else {
        return (
            <div className="vh-100">
                <Suspense fallback={Preloader}>
                    <Routes>
                        <Route path='/login' element={<Login />} />
                        <Route path='/forgot-password' element={<ForgotPassword />} />
                        <Route path='/kyc-login' element={<KycLogin />} />
                        <Route path='/kyc_upload/:id' element={<KycUpload />} />
                        {/* Catch-all: redirect unauthenticated users to login */}
                        <Route path='*' element={<Navigate to="/login" replace />} />
                    </Routes>
                </Suspense>
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        isAuthenticated: isAuthenticated(state),
    };
};

export default withRouter(connect(mapStateToProps)(App));