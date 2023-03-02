const { createApp } = Vue;
// const { axios } = Axios;
const MAXLEN = 3;

const app = createApp({
    data(){
        return{
            word_list: ["tomato", "internet", "urban", "design", "game", "glass", "money", "book"],
            select_list: [],
            imgsrc: ""
        }
    },
    methods: {
        input_answer(word){
            if(this.select_list.length >= MAXLEN){
                this.select_list.push(word);
                this.select_list.shift();
            }
            else{
                this.select_list.push(word);
            }
            return console.log(word);
        },
        makeimg(){
            let words = `${this.select_list[0]} ${this.select_list[1]} ${this.select_list[2]}`
            let post = axios.post("http://localhost:3000/", { word: words }).then((response) => {
                console.log("postで送信");
                this.catchimg(response.data);
            }).catch((err) =>{
                console.log("エラー");           
                console.log(err);    
            });
        },
        catchimg(img){
            //imgはbase64形式
            document.getElementById("img").src = "data:image/png;base64," + img;
        },
    }
})

app.mount("#main");