
/**
 * 
 * @param {*} userRole 
 * @param {*} authorizedRoles 
 * @returns 
 */
function verifyRoleAccess(userRole, authorizedRoles = []) {
	if (authorizedRoles.includes(userRole)) {
		return(true);
	}
	return(false);
}

module.exports = {
	verifyRoleAccess,
}