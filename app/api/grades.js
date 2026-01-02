// Create this file: pages/api/grades.js
export default async function handler(req, res) {
    const { student_id } = req.query;

    try {
        // This fetch happens on the SERVER side (no CORS issues)
        const response = await fetch(
            `http://zdspgc-mahayag.rf.gd/admin/api/get_student_grades.php?student_id=${student_id}`
        );

        const data = await response.json();

        // Send back to frontend
        res.status(200).json(data);

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error: ' + error.message
        });
    }
}