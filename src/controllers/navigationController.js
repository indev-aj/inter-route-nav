class NavigationController {
    static findPossibleRoute = async (req, res) => {
        try {
            return res.ok({ message: 'Result OK'});
        } catch (error) {
            res.status(500).json({ message: 'Internal Server Error'});
        }
    }
}

export default NavigationController;