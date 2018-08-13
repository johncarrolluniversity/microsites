function changeContent(description) {
	console.log(description);
	var MyDesc = document.getElementbyId(description);
	document.getElementbyId('content').innerHTML = MyDesc.value;
}