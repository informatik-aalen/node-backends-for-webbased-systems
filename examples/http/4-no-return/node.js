// This examples sends HTML-String with correct mimetype
const response = `
<html>
	<head/>
	<body>Hello world!</body>
</html>
`
exports.no_return = (req,res) => {
	res.type("html");
	res.send(response);
}
