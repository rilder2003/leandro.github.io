(function(){
    const board=document.getElementById("board");
    let h=board.clientWidth/2;
    let v=board.clientHeight/2;
    let speed=300;
    let process=undefined;
    let apple=[];
    let direction="L"; // set direction Up, Down, Left, Right
    let snake=[];

    window.addEventListener("keyup", e => {
        if (process!=undefined && [37, 38, 39, 40].indexOf(e.keyCode)!=-1) {
            newDirection={38:"U", 40:"D", 39:"R", 37:"L"}[e.keyCode];
            if (
                (newDirection=="U" && direction!="D") ||
                (newDirection=="D" && direction!="U") ||
                (newDirection=="R" && direction!="L") ||
                (newDirection=="L" && direction!="R")
            ) {
                direction=newDirection;
            }
        }
    });

    const buttonStart = document.getElementById("start");
    const buttonPause = document.getElementById("pause");
    buttonStart.addEventListener("click", () => {
        apples.innerText="0";
        board.classList.remove("fail");
        removeDivs(board);
        speed=300;
        direction="L"; // set direction Up, Down, Left, Right
        // definimos los tres primeros elementos de la serpiente
        snake=[[h, v], [h+10, v], [h+20, v]];
        board.insertBefore(createDiv([h, v]), null);
        board.insertBefore(createDiv([h+10, v]), null);
        board.insertBefore(createDiv([h+20, v]), null);

        apple=setApple(snake); // set position of apple [h,v]
        process=setInterval(movement, speed);
        buttonPause.disabled=false;
        buttonStart.disabled=true;
    });

    buttonPause.addEventListener("click", () => {
        if (buttonPause.value=="pause") {
            process=clearInterval(process);
            buttonPause.value="restart";
        } else {
            process=setInterval(movement, speed);
            buttonPause.value="pause";
        }
    });

    /**
     * Funcion que se ejecuta cada n milisegundos
     */
    function movement() {
        // obtenemos la nueva posicion de la cabeza de la serpiente
        const newPosition=getNextPosition(direction, snake[0]);

        // comprobamos si nos hemos comido la manzana
        if (checkNewPositionIsApple(newPosition, apple)) {
            board.insertBefore(createDiv(apple), board.querySelectorAll("div")[0]);
            snake.unshift(apple);
            setTail(snake[snake.length-1], snake[snake.length-2]);
            setHead(snake[0], snake[1]);
            apple=setApple(snake); // set position of apple [h,v]
            if (speed > 50) {
                process=clearInterval(process);
                speed=Math.round(speed/1.02);
                process=setInterval(movement, speed);
            }
            let apples=document.getElementById("apples");
            apples.innerText=parseInt(apples.innerText)+1;
            return;
        }

        // comprobamos que no nos pisemos la cola
        if (checkOverTail(newPosition, snake)) {
            end();
            snake=snakeRedraw(newPosition, snake);
            setTail(snake[snake.length-1], snake[snake.length-2]);
            return;
        }

        // movemos la serpiente
        const last=snake.pop();
        snake=snakeRedraw(newPosition, snake);

        // comprobamos que no nos hayamos pasado de los margenes
        if (checkNewPositionIsOutside(newPosition)) {
            end();
            return;
        }
    }

    /**
     * Funcion que se ejecuta cuando finaliza el juego
     */
    function end() {
        process=clearInterval(process);
        board.classList.add("fail");
        buttonPause.disabled=true;
        buttonStart.disabled=false;
    }

    /**
     * Funcion que elimina el ultimo div y añade un div nuevo al inicio
     * 
     * @param array newPosition con la nueva posicion para el nuevo div
     * @param array snake - array de la serpiente
     * @return array - new arraw of snake
     */
    function snakeRedraw(newPosition, snake) {
        board.lastElementChild.remove();
        board.insertBefore(createDiv(newPosition), board.querySelector("div"));
        snake.unshift(newPosition);
        setTail(snake[snake.length-1], snake[snake.length-2]);
        setHead(snake[0], snake[1]);
        return snake;
    }

    /**
     * Funcion que determina la dirección de la cola
     *
     * @param array last - posicion [h,v] del ultimo elemento
     * @param array antepenultimate - posicion [h,v] del penultimo elemento
     */
    function setTail(last, antepenultimate) {
        const lastDiv=board.querySelectorAll("div")[board.querySelectorAll("div").length-1];
        lastDiv.classList.remove("right", "up", "down");
        if (antepenultimate[0]>last[0]) { // dirección derecha
            lastDiv.classList.add("right");
        } else if (antepenultimate[1]>last[1]) { // direccion subida
            lastDiv.classList.add("up");
        } else if (antepenultimate[1]<last[1]) { // direccion bajada
            lastDiv.classList.add("down");
        }
    }

    /**
     * Funcion que determina la dirección de la cabeza
     *
     * @param array first - posicion [h,v] del primer elemento
     * @param array second - posicion [h,v] del segundo elemento
     */
    function setHead(first, second) {
        const firstDiv=board.querySelectorAll("div")[0];
        firstDiv.classList.remove("right", "up", "down");
        if (second[0]<first[0]) { // dirección derecha
            firstDiv.classList.add("right");
        } else if (second[1]<first[1]) { // direccion subida
            firstDiv.classList.add("up");
        } else if (second[1]>first[1]) { // direccion bajada
            firstDiv.classList.add("down");
        }
    }

    /**
     * Funcion que crear un nuevo div en una posicion determinada
     *
     * @param position array - con la posicion de nuevo div [h,v]
     * @return object devuelve el nuevo div creado
     */
    function createDiv(position) {
        let newDiv=document.createElement("div");
        newDiv.style.left=position[0]+"px";
        newDiv.style.top=position[1]+"px";
        return newDiv;
    }

    /**
     * Funcion que devuelve la nueva posicion del primer elemento
     *
     * @param string direccion actual (Up, Down, Left, Right)
     * @param array con la posicion del primer elemento de la serpiete [h,v]
     * @return array con las nueva posicion [h,v]
     */
    function getNextPosition(direction, position) {
        if (direction=="U") {
            return [position[0], position[1]-10];
        } else if (direction=="D") {
            return [position[0], position[1]+10];
        } else if (direction=="R") {
            return [position[0]+10, position[1]];
        } else if (direction=="L") {
            return [position[0]-10, position[1]];
        }
    }

    /**
     * Funcion que comprueba que la nueva posición no se salga del tablero
     *
     * @return boolean
     */
    function checkNewPositionIsOutside(newPosition) {
        return newPosition[0]<0 ||
            newPosition[1]<0 ||
            newPosition[0]+10>board.clientHeight ||
            newPosition[1]+10>board.clientWidth;
    }

    /**
     * Funcion para verificar si la posicion recibida esta encima de la serpiente
     * 
     * @param array - [h, v]
     * @param array - [[h, v], [h, v], ...]
     * @return boolean
     */
    function checkOverTail(position, snake) {
        return snake.find(el => el[0]==position[0] && el[1]==position[1])!=undefined;
    }

    /**
     * Funcion que compara la nueva posicion de la serpiente con la posicion de la manzana
     *
     * @param array - [h, v]
     * @param array - [h, v]
     * @return boolean
     */
    function checkNewPositionIsApple(newPosition, applePosition) {
        return newPosition.every((value, index) => value === applePosition[index]);
    }

    /**
     * Funcion que posiciona la manzana en el tablero y devuelve su posicion
     *
     * @param array snake - con las posiciones de la serpiente
     * @return array - posicion de manzada [h,v]
     */
    function setApple(snake) {
        let h,v;
        while (1) {
            h=Math.round(Math.random()*(board.clientWidth-10)/10)*10;
            v=Math.round(Math.random()*(board.clientWidth-10)/10)*10;
            if (snake.indexOf([h, v])==-1) {
                break;
            }
        }
        board.querySelector("span").style.left=h+"px";
        board.querySelector("span").style.top=v+"px";
        return [h,v];
    }

    /**
     * Function que elimina todos los divs dentro del elemento
     * 
     * @param object - elemento a eliminar los divs de su interior
     * @return int - la cantidad de elementos eliminados
     */
    function removeDivs(element) {
        return [...element.querySelectorAll("div")].map(el => el.remove()).length;
    }
})();
