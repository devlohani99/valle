interface Props{
  params:{
    projectId:string;
  }
}



const page=async({params}:Props)=>{
    const {projectId}=await params;
  return(
    <div>
      <h1>Project id:{projectId}</h1>
    </div>
  )
}