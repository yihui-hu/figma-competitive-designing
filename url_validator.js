async function url_validator(url) {
    const ARENA_API_BASE_URL = "https://api.are.na/v2";
    const channelURL = url.split("/");
    const channelSlug = channelURL[channelURL.length - 1];
    try {
        const response = await fetch(`${ARENA_API_BASE_URL}/channels/${channelSlug}/contents`);
        console.log(response);
    } catch (err) {
        console.log("Unable to resolve Are.na URL");
    }
}