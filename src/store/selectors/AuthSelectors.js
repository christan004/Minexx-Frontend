export const isAuthenticated = (state) => {
    if (state.auth.auth) return true;
    return false;
};
