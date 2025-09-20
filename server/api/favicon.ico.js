export default function handler(req, res) {
    // Return a simple favicon response
    res.setHeader('Content-Type', 'image/x-icon');
    res.status(200).send();
}
