// import axios from 'axios';
// import { useEffect, useState } from 'react';

// const Test = ()=>{
    
// const url = 'https://jsonplaceholder.typicode.com/users'
// const[user , setUser] = useState([])
//    useEffect(()=>{
//    const fetchData = async()=>{
//     try{
//          const response = await axios.get(url)
//          const fetchedData = response.data;
//          setUser(fetchedData)
//          console.log(fetchedData)
//      }catch(err){
//         console.log("failed to fetch data", err )
//     }
//    }

//    fetchData()
//    }, [])

//    const addUser = async() =>{
//     const newUser = {
//         name: 'newUser',
//         email: 'newuser@gmail.com',
//         age: 10 ,
//     }
//     try{
//     const response  = await axios.post(url , newUser)
//     const data = response.data ;
//     setUser(prev => [...prev, data])
//     }catch(error){
//         console.log(error)
//     }
//    }
    
//  return (
//  <div>
//     <ul>
//         {user.map((user)=>
//         (
           
//             <li key={user.id}>
//                 <strong>Name:</strong>{user.name}
//                 <strong>Email:</strong>{user.email}
//                 <strong>Phone:</strong>{user.phone}
//                 </li>
           
//         ))}
//     </ul>  

//     <button onClick={addUser}>Add user</button> 
//  </div>
// );
// }

// export default Test ;