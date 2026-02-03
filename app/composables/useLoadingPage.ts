export const useLoadingPage = () => {
    const loading = useState('loading', () => false)
    return {
        loading
    }
}
