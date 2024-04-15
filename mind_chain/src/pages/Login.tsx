import { Form, Input, Button, message, Row, Col } from "antd";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../css/Login.css";

const Login: React.FC = () => {
  const navigate = useNavigate();

  const onFinish = async (values: any) => {
    try {
      const response = await axios.post(
        "http://localhost:8080/user/login",
        values
      );
      if (response.data.code === 0) {
        message.success("登录成功");
        sessionStorage.setItem("userId", response.data.data);
        navigate("/flow");
      } else {
        message.error("账号或密码错误");
      }
    } catch (error) {
      message.error("请求失败");
    }
  };

  return (
    <Row justify="center" align="middle" style={{ minHeight: "100vh" }}>
      <Col span={8}>
        <div className="login-container">
          <Form name="login-form" onFinish={onFinish}>
            <Form.Item
              name="account"
              rules={[{ required: true, message: "请输入账号" }]}
            >
              <Input placeholder="账号" />
            </Form.Item>
            <Form.Item
              name="password"
              rules={[{ required: true, message: "请输入密码" }]}
            >
              <Input.Password placeholder="密码" />
            </Form.Item>
            <Form.Item>
              <a href="/register" className="register-link">
                注册账号
              </a>
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" block>
                登录
              </Button>
            </Form.Item>
          </Form>
        </div>
      </Col>
    </Row>
  );
};

export default Login;
