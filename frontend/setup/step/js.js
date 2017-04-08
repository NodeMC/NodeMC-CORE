function getApiKey() {
    $.get("/v2/firstrun/apikey", function(data){
       $("#key").val(data);
       localStorage.setItem("apikey", data);
    });
}

function serverports() {
    var nmc_port = $("#nodemc_port").val();
    var mn_port = $("#minecraft_port").val();
    if(nmc_port == ""){
        nmc_port = 3000;
    }
    if(mn_port == ""){
        mn_port = 25565;
    }

    localStorage.setItem("nodemc_port", nmc_port);
    localStorage.setItem("minecraft_port", mn_port);
}

function set_directory(){
    localStorage.setItem("directory",$("#directory").val());
}

function set_memory(){
    var ram = $("#memory").val();
    localStorage.setItem("memory", ram);
}

function set_jarfile() {
    var version = $("#version").val();
    var flavour = $("#flavour").val();
    localStorage.setItem("version", version);
    localStorage.setItem("flavour", flavour);
}

function showinfo() {
    // Key
    document.getElementById("apikey").innerHTML = "API Key: " + localStorage.getItem("apikey");
    document.getElementById("nmc_port").innerHTML = "NodeMC Port: " + localStorage.getItem("nodemc_port");
    document.getElementById("mc_port").innerHTML = "Minecraft Port: " + localStorage.getItem("minecraft_port");
    document.getElementById("memory").innerHTML = "RAM (In MB): " + localStorage.getItem("memory");
    document.getElementById("directory").innerHTML = "Jarfile directory " + localStorage.getItem("directory");
    document.getElementById("jarfile_v").innerHTML = "Jar Version: " + localStorage.getItem("version");
    document.getElementById("jarfile_f").innerHTML = "Jar Flavour: " + localStorage.getItem("flavour");

}

function submitinfo() {
     $(".loader").show();
    $.post("/v2/firstrun/setup", {
            nmc_port: localStorage.getItem("nodemc_port"),
            mc_port: localStorage.getItem("minecraft_port"),
            memory: localStorage.getItem("memory"),
            directory: localStorage.getItem("directory"),
            version: localStorage.getItem("version"),
            flavour: localStorage.getItem("flavour")
        })
        .done(function(data) {
            $(".loader").hide();
            var result = JSON.parse(data);
            console.log(data);
            if (result['sucess'] == true) {
                window.location.href = "/step/finish.html";
            } else {
                $("#done").hide();
                $("#login").hide();
                document.getElementById("error").innerHTML = result['moreinfo'] + "!";
                console.log(result['message'] + " More: " + result['moreinfo']);
            }
        });
}
