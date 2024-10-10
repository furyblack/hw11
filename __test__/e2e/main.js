// нативка первый спринт первый урок
// типы данных примитивы и ссылочные

//примитивы

// string строка
// number число
// boolean да или нет правда или ложь
// undefined  не определенный тип
// null ничего
// symbol  - ?
// bigINt большое число

const  user = {
    age: 32,
    name: 'vik',
}

const copuUser = {...user, age: user.age+1}
console.log(copuUser)

const array = [1,2,3,4]
array[array.length] = 6
console.log(array)


