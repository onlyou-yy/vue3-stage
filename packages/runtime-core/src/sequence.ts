// 求最长递增子序列的个数（并不一定是连续的，是递增的就行）
// 3 2 8 9 5 6 7 11 15 4
// 最长递增子序列：3｜2 5 6 7 11 15，这里 2，3都可以作为开头，但是2更加有潜力，因为之后的数据比2大的几率要更大
// Vue3中实现这种算法是通过 贪心算法 + 二分查找 实现的

// 那么上面这个应该怎么进行查找
// 首先找最有潜力的（最小值）
// 首先找到3 => 3 
// 然后找到2，2 < 3,将3替换成2 => 2 
// 然后找到8，8 > 2,添加8 => 2 8 
// 然后找到9，9 > 8,添加9 => 2 8 9
// 然后找到5，5 < 9,进行二分查找大于5的数8然后替换 => 2 5 9
// 然后找到6，6 < 9,进行二分查找大于6的数9然后替换 => 2 5 6
// 之后依次类推就可以得到 => 2 4 6 7 11 15


// 注意：最后的 4 不能放入序列中，因为放入来就不是最长递增子序列了
// 所以上面的算法只能找到最长递增子序列的个数，因为实际上算法会把4也替换进去
// 那么得到的结果就会是 2 4 6 7 11 15

// 那么应该如何解决这个问题？
// 可以让每个节点记录一下他们前一个节点的索引，之后通过最后一项将结果还原
// 数组： 2 3 1 5 6 8 7 9 4
// 索引： 0 1 2 3 4 5 6 7 8
// 首先找到 2，因为2是第一个元素，前面已经没有元素了，所以不用记录
// 然后找到 3，3 > 2,添加3，并记录前一项2的索引0 => 2 3->0
// 然后找到 1，1 < 3,进行二分查找大于1的数2然后替换,并记录前一项索引 => 1 3->0
// 然后找到 5，5 > 3,添加5，并记录前一项3的索引1 => 2 3->0 5->1
// 然后找到 6，6 > 5,添加6，并记录前一项5的索引3 => 2 3->0 5->1 6->3 
// 然后找到 8，8 > 6,添加8，并记录前一项6的索引4 => 2 3->0 5->1 6->3 8->4
// 然后找到 7，7 < 8,进行二分查找大于7的数8然后替换,并记录前一项索引 => 2 3->0 5->1 6->3 7->4
// 最终可以得到：2 3->0 4->1 6->3 7->4 9->6
// 通过最后一项9来进行反向链式索引查询可以得到 9->arr[6]->arr[4]->arr[3]->arr[1]->arr[0]
//  => 9 7 6 5 3 2

/**获取最长增长子序列 */
export function getSequence(arr){
  const len = arr.length;
  const result = [0];//以默认第0个为基准来做序列
  const p = new Array(len).fill(0);//最后标记索引（放的东西不关心，但是要和数组一样长）
  let resultLastIndex;//最后一个索引
  let start;//二分查找开始值
  let end;//二分查找结束值
  let middle;//二分查找中间值
  for(let i = 0;i < len;i ++){
    let arrI = arr[i];
    if(arrI !== 0){//因为vue里面的序列中0表示节点还没有创建，所以不需要计算
      resultLastIndex = result[result.length - 1];
      if(arr[resultLastIndex] < arrI){//比较最后一项和当前项的值，如果比最后一项大，则将当前索引放到结果集中
        result.push(i);
        p[i] = resultLastIndex;//当前放到末尾的要记住他前面的那个人是谁
        continue;
      }
      //通过二分查找在结果集中找到比当前值大的，并进行替换
      start = 0;
      end = result.length - 1;
      while(start < end){
        middle = ((start + end) / 2) | 0;// 2.5｜0 -> 2
        if(arr[result[middle]] < arrI){
          start = middle + 1;
        }else{
          end = middle;
        }
      }
      if(arr[result[start]] > arrI){
        result[start] = i;
        p[i] = result[start - 1];//记住前一个人是谁
      }
    }
  }

  // 通过最后一项进行回溯
  let i = result.length;
  let last = result[i-1]; //找到最后一项

  while(i-- > 0){//倒序追溯
    result[i] = last;//最后一项时确定的
    last = p[last];
  }

  return result
}

console.log(getSequence([2,3,1,5,6,8,7,9,4]));
console.log(getSequence([3,2,8,9,5,6,7,11,15,4]));

