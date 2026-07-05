import type { NextConfig } from "next";

const nextConfig: NextConfig = {

typescript:{
ignoreBuildErrors:true
},

images:{

remotePatterns:[

{

protocol:"https",
hostname:"iffvqdzzhwhdcpirdbkc.supabase.co"

}

]

}

};

export default nextConfig;