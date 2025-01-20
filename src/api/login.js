export const loginApi = async (email, password) => {
    console.log("email & pswd", email, " - ", password)
    const userData = {
        "id": "recUn5j1f7aQ0HRxI",
        "createdTime": "2023-07-15T17:19:42.000Z",
        "fields": {
            "EmployeeID": "3E",
            "Status": "active",
            "IsAdmin": true,
            "EmailId": "shardaAssociates@gmail.com",
            "address": "Bhopal",
            "LastName": "Associates",
            "Designation": "Developer",
            "DateOfJoining": "2024-01-24",
            "password": "Password@123",
            "All_Reports": [
                "recTKtbACUoLi7lwK",
                "recAx4InF4n143tml"
            ],
            "FirstName": "Sharda",
            "All_Reports copy": "1R, Unnamed record"
        }
    }
    return userData;
}

export const logout = () => {
    localStorage.removeItem('userData');
    return "logout successfully"
}