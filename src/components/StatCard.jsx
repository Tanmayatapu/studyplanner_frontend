export default function StatCard({title,value}){
  return(
    <div className="bg-card p-6 rounded-xl">
      <p className="text-gray-400">{title}</p>
      <h2 className="text-3xl font-bold mt-2">{value}</h2>
    </div>
  )
}