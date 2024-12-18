import { OrganizationSchema } from "@/data/types";
import { getOrgInfo } from "@/utils/api";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Cookies from "universal-cookie";
const OrgInfoPage = () => {
    const { orgId } = useParams<{ orgId: string }>() as { orgId: string };
    const cookie = new Cookies();

    const [orgData, setOrgData] = useState<OrganizationSchema>();

    useEffect(() => {
        getOrgInfo(orgId, cookie.get("token")).then((data) => {
            setOrgData(data);
        });
    }, []);

    return (
        <div>
            <h1>{orgData?.name}</h1>
            <p>{orgData?.description}</p>
        </div>
    );
};

export default OrgInfoPage;
