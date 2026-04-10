import {Link,useLocation} from "react-router-dom";

const menu=[
  {name:"Dashboard",path:"/dashboard"},
  {name:"Subjects",path:"/subjects"},
  {name:"Study Plan",path:"/study-plan"},
  {name:"Progress",path:"/progress"},
  {name:"Settings",path:"/settings"},
];

export default function Sidebar(){
  const {pathname}=useLocation();

  return(
    <div className="w-64 h-screen bg-dark fixed p-6">
      <h1 className="text-2xl font-bold text-primary mb-10">
        AI Planner
      </h1>

      <div className="space-y-4">
        {menu.map(item=>(
          <Link key={item.path} to={item.path}
          className={`block p-3 rounded-lg ${
            pathname===item.path
            ? "bg-primary"
            : "hover:bg-gray-800"
          }`}>
            {item.name}
          </Link>
        ))}
      </div>
    </div>
  )
}