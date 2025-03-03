const logout = (req, res) => {
    if (req.session) {
        req.session.destroy((err) => {
            if (err) {
                console.error("Error destroying session:", err);
                return res.status(500).json({ message: "Error logging out" });
            }
            res.clearCookie("connect.sid"); // Clears session cookie
            return res.status(200).json({ message: "Logged out successfully" });
        });
    } else {
        return res.status(400).json({ message: "No active session found" });
    }
};

module.exports = logout;
