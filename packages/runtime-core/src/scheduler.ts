let queue = [];
let isFlushing = false;
const resolvePromise = Promise.resolve();

/**批量处理任务，异步执行 */
export function queueJob(job){
  if(!queue.includes(job)){
    queue.push(job);
  }
  if(!isFlushing){
    isFlushing = true;
    //放入微任务队列执行
    resolvePromise.then(()=>{
      isFlushing = false;//执行后重新打开入口
      let copy = queue.slice(0);
      queue.length = 0;
      for(let i = 0;i < copy.length;i++){
        let job = copy[i];
        job();
      }
      // queue.length = 0;//不能在这里进行清空操作，因为在执行job的时候可能也会往queue里加任务
      copy.length = 0;
    })
  }
}