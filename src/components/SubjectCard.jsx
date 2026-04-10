export default function SubjectCard({name,progress}){
  return(
    <div className="bg-card p-5 rounded-xl">
      <h3 className="text-lg font-semibold">{name}</h3>
      <div className="w-full bg-gray-700 h-2 rounded mt-3">
        <div 
        style={{width:progress+"%"}}
        className="bg-primary h-2 rounded"/>
      </div>
      <p className="mt-2 text-sm">{progress}% completed</p>
    </div>
  )
}