const sum=require('./sum')

test("should return sum",()=>{
    expect(sum(1,2)).toBe(3)
})